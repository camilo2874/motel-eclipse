import { Router } from 'express'

const router = Router()

router.get('/', (req, res) => {
  res.json({ message: 'Reportes route - En desarrollo' })
})

export default router
