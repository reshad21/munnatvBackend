import { Router } from 'express';
import { TModuleRoute } from '../types/moduleRoute.type';

import { AboutUsRoutes } from '../modules/about-us/about-us.routes';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { BlogRoutes } from '../modules/blog/blog.routes';
import { ContactRoutes } from '../modules/contact/contact.routes';
import { FivePillarRoutes } from '../modules/fivepillar/fivepillar.routes';
import { RoleRoutes } from '../modules/role/role.routes';
import { ServiceRoutes } from '../modules/service/service.routes';

import { GalleryRoutes } from '../modules/gallery/gallery.routes';

import { ReviewRoutes } from '../modules/review/review.routes';
import { VideoGalleryRoutes } from '../modules/video-gallery/video-gallery.routes';

import { PackageRoutes } from '../modules/package/package.routes';
import { ContactUsRoutes } from '../modules/contact-us/contact-us.routes';
import { OtherAboutUsRoutes } from '../modules/other-about-us/other-about-us.routes';
import { HeroAreaRoutes } from '../modules/hero-area/hero-area.routes';

const router = Router();

const moduleRoutes: TModuleRoute[] = [
  {
    path: '/contactus',
    route: ContactUsRoutes,
  },
  {
    path: '/blogs',
    route: BlogRoutes,
  },
  {
    path: '/contacts',
    route: ContactRoutes,
  },
  {
    path: '/reviews',
    route: ReviewRoutes,
  },
  {
    path: '/video-gallery',
    route: VideoGalleryRoutes,
  },
  {
    path: '/fivepillars',
    route: FivePillarRoutes,
  },
  {
    path: '/services',
    route: ServiceRoutes,
  },
  {
    path: '/packages',
    route: PackageRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/roles_permissions',
    route: RoleRoutes,
  },
  {
    path: '/blogs',
    route: BlogRoutes,
  },
  {
    path: '/gallery',
    route: GalleryRoutes,
  },
  {
    path: '/aboutus',
    route: AboutUsRoutes,
  },
  {
    path:'/other-about-us',
    route: OtherAboutUsRoutes,
  },
  {
    path: '/contacts',
    route: ContactRoutes,
  },
  {
    path: '/hero-section',
    route: HeroAreaRoutes,
  }

];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
