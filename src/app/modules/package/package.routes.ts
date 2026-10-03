import express from 'express';
import { featureNames } from '../../constant/seedRoleData';
import { can } from '../../constant/permissions';
import auth from '../../middlewares/authorization';
import { imageUpload, uploadImages } from '../../middlewares/multer';
import { PackageController } from './package.controller';

const router = express.Router();

router.post(
    '/',
    auth([can(featureNames.packages, 'create')]),
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
    auth([can(featureNames.packages, 'status')]),
    PackageController.updatePackageStatus,
);

router.get(
    '/:id',
    PackageController.getPackageById
);
router.put(
    '/:id',
    auth([can(featureNames.packages, 'edit')]),
    imageUpload.array('images', 10),
    uploadImages,
    PackageController.updatePackage
);
router.delete(
    '/:id',
    auth([can(featureNames.packages, 'delete')]),
    PackageController.deletePackage
);

router.post(
    '/image',
    auth([can(featureNames.packages, 'create')]),
    imageUpload.single('image'),
    uploadImages,
    PackageController.addPackageImage,
);

router.delete(
    '/image/:id',
    auth([can(featureNames.packages, 'delete')]),
    PackageController.deletePackageImage,
);

export const PackageRoutes = router;
