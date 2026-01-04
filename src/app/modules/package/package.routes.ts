import express from 'express';
import { featureNames } from '../../constant/seedRoleData';
import auth from '../../middlewares/authorization';
import { imageUpload, uploadImages } from '../../middlewares/multer';
import { PackageController } from './package.controller';

const router = express.Router();

router.post(
    '/',
    auth([featureNames.packages]),
    imageUpload.array('images', 10),
    uploadImages,
    PackageController.createPackage
);
router.get(
    '/',
    PackageController.getAllPackages
);

router.patch(
    '/:id/status',
    auth([featureNames.packages]),
    PackageController.updatePackageStatus,
);

router.get(
    '/:id',
    PackageController.getPackageById
);
router.put(
    '/:id',
    auth([featureNames.packages]),
    imageUpload.array('images', 10),
    uploadImages,
    PackageController.updatePackage
);
router.delete(
    '/:id',
    auth([featureNames.packages]),
    PackageController.deletePackage
);

router.post(
    '/image',
    auth([featureNames.settings]),
    imageUpload.single('image'),
    uploadImages,
    PackageController.addPackageImage,
);

router.delete(
    '/image/:id',
    auth([featureNames.settings]),
    PackageController.deletePackageImage,
);

export const PackageRoutes = router;
