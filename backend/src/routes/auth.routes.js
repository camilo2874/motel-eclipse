import { Router } from 'express'

const router = Router()

// Endpoint temporal
router.get('/me', (req, res) => {
  res.json({ message: 'Auth route - En desarrollo' })
})

export default router
