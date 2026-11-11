import {handlePhotoRequest} from '../../server/photo.js';
export const onRequest=context=>handlePhotoRequest(context);
