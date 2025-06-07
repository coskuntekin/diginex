import { createRouter, createWebHistory } from "vue-router";
import { routes } from "./routes";
import {
  checkAccessMiddleware,
  checkAccountStatus,
  setPageTitleMiddleware,
} from "./middleware";

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

router.beforeEach(checkAccessMiddleware);
router.beforeEach(setPageTitleMiddleware);
router.beforeEach(checkAccountStatus);

export default router;
