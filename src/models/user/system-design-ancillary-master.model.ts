import { model } from 'mongoose';
import { SystemDesignAncillaryMasterSchema } from './system-design-ancillary-master.schema';

export const SystemDesignAncillaryMasterModel = model(
  'SYSTEM_DESIGN_ANCILLARY_MASTER',
  SystemDesignAncillaryMasterSchema,
  'v2_system_design_ancillaries_master'
);
