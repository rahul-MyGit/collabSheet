import express, { Request, Response } from 'express'
import { userRoute } from '@/routes/index'
import cors from 'cors'
import { ENV } from './config'

const app = express()
app.use(express.json())
app.use(cors())


app.use('/api/v1/user', userRoute);

app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server working fine!!',
  })
});

app.listen(ENV.PORT, () => {
  console.log(`Server is running on port: ${ENV.PORT}`)
});
