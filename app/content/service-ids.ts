/** Order matters: it is also the index of the matching focus state in the 3D roof scene. */
export const SERVICE_IDS = ['pitched', 'flat', 'insulation', 'renovation', 'asbestos'] as const;
export type ServiceId = typeof SERVICE_IDS[number];
