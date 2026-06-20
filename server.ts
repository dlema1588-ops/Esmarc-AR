import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { createServer as createViteServer } from "vite";
import { env } from "./src/config/env";

import { authMiddleware, requireSuperAdmin } from "./src/middlewares/auth.middleware";
import { tenantMiddleware } from "./src/middlewares/tenant.middleware";
import { errorHandler } from "./src/middlewares/error.middleware";

import platformRoutes from "./src/modules/platform/platform.routes";
import tenantRoutes from "./src/modules/tenant/tenant.routes";
import variantsRoutes from "./src/modules/variants/variants.routes";
import domainsRoutes from "./src/modules/domains/domains.routes";
import notificationsRoutes from "./src/modules/notifications/notifications.routes";
import analyticsRoutes from "./src/modules/analytics/analytics.routes";
import saasRoutes from "./src/modules/saas/saas.routes";

import productsRoutes from "./src/modules/products/products.routes";
import customersRoutes from "./src/modules/customers/customers.routes";
import ordersRoutes from "./src/modules/orders/orders.routes";
import storageRoutes from "./src/modules/storage/storage.routes";
import workspacesRoutes from "./src/modules/workspaces/workspaces.routes";


const app = express();
const PORT = parseInt(env.PORT, 10);

app.use(express.json());
app.use(cors());

// Configure Helmet depending on the environment
if (env.NODE_ENV !== "production") {
  // Allow iframe embedding and relax policies for Google AI Studio preview
  app.use(
    helmet({
      contentSecurityPolicy: false,
      xFrameOptions: false,
      crossOriginResourcePolicy: false,
    })
  );
} else {
  // Production security defaults
  app.use(helmet());
}

// API Routes
app.use('/api/v1/admin/domains', authMiddleware, requireSuperAdmin, domainsRoutes);
app.use('/api/v1/admin/notifications', authMiddleware, requireSuperAdmin, notificationsRoutes);
app.use('/api/v1/admin/analytics', authMiddleware, requireSuperAdmin, analyticsRoutes);
app.use('/api/v1/admin', authMiddleware, requireSuperAdmin, platformRoutes);

app.use('/api/v1/variants', authMiddleware, tenantMiddleware, variantsRoutes);
app.use('/api/v1/products', authMiddleware, productsRoutes);
app.use('/api/v1/customers', authMiddleware, customersRoutes);
app.use('/api/v1/orders', authMiddleware, ordersRoutes);
app.use('/api/v1/storage', authMiddleware, storageRoutes);
app.use('/api/v1/saas', authMiddleware, tenantMiddleware, saasRoutes);
app.use('/api/v1/workspaces', workspacesRoutes);
app.use('/api/v1', authMiddleware, tenantMiddleware, tenantRoutes);


// Error Handling Middleware should be the last middleware
app.use(errorHandler);

// --- VITE DEV MIDDLEWARE & START ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Backend] ESMARC Platform Server running on port ${PORT}`);
  });
}

startServer();

