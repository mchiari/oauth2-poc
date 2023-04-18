/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import type { NextApiRequest, NextApiResponse } from 'next'
import axios from "axios"
import qs from 'query-string'

type Data = {
  name: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
  // res: NextApiResponse<Data>
) {

  try {
    const token = await exchangeCodeForAccessToken(req.body.code)
    console.log('---- token: ', token)
    const user = await fetchUser(token);
    res.status(200)
    res.send(user)
  } catch (error) {
    // console.log("API Error: ", error)
    res.status(500)
  }

  async function exchangeCodeForAccessToken(code: string) {
    const GITHUB_ACCESS_TOKEN_URL = 'https://github.com/login/oauth/access_token';

    const { NEXT_PUBLIC_GITHUB_REDIRECT_URI, NEXT_PUBLIC_GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = process.env;
    // console.log(NEXT_PUBLIC_GITHUB_REDIRECT_URI)
    // console.log(NEXT_PUBLIC_GITHUB_CLIENT_ID)
    // console.log(GITHUB_CLIENT_SECRET)

    const body = {
      code,
      grant_type: 'authorization_code',
      client_id: NEXT_PUBLIC_GITHUB_CLIENT_ID,
      redirect_uri: NEXT_PUBLIC_GITHUB_REDIRECT_URI,
      client_secret: GITHUB_CLIENT_SECRET
    }

    const { data } = await axios.post(GITHUB_ACCESS_TOKEN_URL, body, {
      headers: { 'Content-Type': 'application/json' }
    })

    console.log(data)

    const parsedData = qs.parse(data);

    return parsedData.access_token
  }

  async function fetchUser(token: string){
    const response = await axios.get('http://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response.data
  }

  // res.status(200).json({ name: `Secret: ${process.env.GITHUB_CLIENT_SECRET ?? 'undefined'}` })
}