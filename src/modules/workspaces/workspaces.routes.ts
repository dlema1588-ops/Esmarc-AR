import { Router } from 'express';
import * as ctrl from './workspaces.controller';

const router = Router();

// Workspace Core Admin Endpoints
router.get('/', ctrl.listWorkspaces);
router.post('/', ctrl.createWorkspace);
router.get('/:id', ctrl.getWorkspaceDetail);
router.put('/:id/website', ctrl.updateWebsiteSettings);
router.post('/:id/modules/:moduleKey', ctrl.toggleWorkspaceModule);

// Isolated modules CRUD channels
router.get('/:id/products', ctrl.getProductsByWorkspace);
router.post('/:id/products', ctrl.createProductForWorkspace);

router.get('/:id/orders', ctrl.getOrdersByWorkspace);
router.post('/:id/orders', ctrl.createOrderForWorkspace);

router.get('/:id/appointments', ctrl.getAppointmentsByWorkspace);
router.post('/:id/appointments', ctrl.createAppointmentForWorkspace);

router.get('/:id/courses', ctrl.getCoursesByWorkspace);
router.post('/:id/courses', ctrl.createCourseForWorkspace);

router.get('/:id/blog_posts', ctrl.getBlogPostsByWorkspace);
router.post('/:id/blog_posts', ctrl.createBlogPostForWorkspace);

router.get('/:id/community_posts', ctrl.getCommunityPostsByWorkspace);
router.post('/:id/community_posts', ctrl.createCommunityPostForWorkspace);
router.post('/:id/community_posts/:postId/like', ctrl.likeCommunityPostInWorkspace);

export default router;
