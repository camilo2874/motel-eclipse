import { Router } from 'express'

const router = Router()

router.get('/', (req, res) => {
  res.json({ message: 'Caja route - En desarrollo' })
})

export default router
