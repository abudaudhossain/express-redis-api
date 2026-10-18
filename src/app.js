import express from 'express'
import healthRoutes from './routes/health.routes.js'
import { errorHandler } from './middleware/error-handler.js'
import productRoutes from './modules/products/product.routes.js'

const app = express()

app.disable('x-powered-by')

app.use(express.json({limit: '1mb'}))

app.use('/health', healthRoutes)
app.use('/products',productRoutes)

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});
app.use(errorHandler);

export default app
