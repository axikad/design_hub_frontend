import type { ApiDesign, ApiEnvelope, ApiFolder, PaginatedEnvelope } from './marketplace';

export interface DesignSpecificationFieldConfig {
  image: boolean;
  nameOrNumber: boolean;
  stitchCount: boolean;
  needle: boolean;
  area: boolean;
  height: boolean;
  width: boolean;
  required: Record<'image' | 'nameOrNumber' | 'stitchCount' | 'needle' | 'area' | 'height' | 'width', boolean>;
}

export interface DesignFormConfig {
  title: boolean;
  machineType: boolean;
  category: boolean;
  designTypes: boolean;
  designSpecifications: boolean;
  sequenceType: boolean;
  designFileType: boolean;
  previewImages: boolean;
  stitchFiles: boolean;
  pricing: boolean;
  designTypeImageCards: boolean;
  required: Record<'title' | 'machineType' | 'category' | 'designTypes' | 'designSpecifications' | 'sequenceType' | 'designFileType' | 'previewImages' | 'stitchFiles' | 'pricing', boolean>;
  specificationFields: DesignSpecificationFieldConfig;
}

export interface DesignOptionMachine {
  id: string;
  name: string;
  imageUri: string | null;
  designFormConfig: DesignFormConfig;
  watermarkEnabled: boolean;
  machineTypeIds: string[];
  categoryIds: string[];
  designFileTypeIds: string[];
}

export interface DesignOptionItem {
  id: string;
  name: string;
  machineId?: string | null;
  machineTypeIds?: string[];
  description?: string | null;
  categoryId?: string;
  extension?: string;
}

export interface DesignOptions {
  machines: DesignOptionMachine[];
  machineTypes: DesignOptionItem[];
  categories: DesignOptionItem[];
}

export interface UploadResult { url: string }

export interface PricingPreview {
  currency: string;
  paymentEnvironment: string;
  isTestMode: boolean;
  itemPricePaise: number;
  buyerPayablePaise: number;
  platformCommission: {
    enabled: boolean;
    basisPoints: number;
    percent: number;
    amountPaise: number;
  };
  sellerGrossPaise: number;
  sellerDeductionsPaise: number;
  estimatedSellerEarningPaise: number;
  taxes: {
    buyerGst: { enabled: boolean; basisPoints: number; percent: number; amountPaise: number; note: string | null };
    commissionGst: { enabled: boolean; basisPoints: number; percent: number; amountPaise: number };
    tds: { enabled: boolean; amountPaise: number };
    gstTcs: { enabled: boolean; amountPaise: number };
  };
  notice: string;
}

export type MyDesignsEnvelope = PaginatedEnvelope<ApiDesign[]>;
export type MyFoldersEnvelope = PaginatedEnvelope<ApiFolder[]>;
export type DesignEnvelope = ApiEnvelope<ApiDesign>;
export type FolderEnvelope = ApiEnvelope<ApiFolder>;
export type MyCatalogsEnvelope = PaginatedEnvelope<ApiFolder[]>;
export type CatalogEnvelope = ApiEnvelope<ApiFolder>;

