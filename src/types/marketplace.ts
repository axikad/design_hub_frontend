export interface ApiImage {
  name: string;
  uri: string;
  sourceUri?: string | null;
  thumbnailUri?: string | null;
  isWatermarked?: boolean;
  downloadUri?: string | null;
}

export interface ApiDesignTypeDetails {
  image: Pick<ApiImage, 'name' | 'uri' | 'thumbnailUri'> | null;
  nameOrNumber: string | null;
  stitchCount: number;
  needle: number;
  area: string | number | null;
  height: string | number | null;
  width: string | number | null;
}

export interface ApiDesignType {
  typeId: string | null;
  typeName: string | null;
  customTypeName?: string | null;
  isCustom?: boolean;
  specificationMode: 'design_property' | 'technical';
  details: ApiDesignTypeDetails;
}

export interface ApiDesignFile {
  name: string;
  displayName: string;
  uri: string | null;
}

export interface ApiDesign {
  id: string;
  machineId: string | null;
  machineTypeId: string | null;
  title: string;
  typeId: string | null;
  typeName: string | null;
  designFileTypeId: string | null;
  designFileTypeName: string | null;
  designFileExtension: string | null;
  categoryId: string | null;
  categoryName: string | null;
  showPrice: boolean;
  publishDate: string | null;
  pricePaise: number;
  sequenceType: string | null;
  measurementUnit: string;
  designTypeImageCards: boolean;
  designTypes: ApiDesignType[];
  images: ApiImage[];
  files: ApiDesignFile[];
  size: string | null;
  color: string | null;
  imageUri: string | null;
  fileName: string | null;
  displayName: string | null;
  fileUri: string | null;
  hasFile: boolean;
  createdAt: string | null;
  sellerName: string | null;
  sellerAvatarUri: string | null;
  ownerKey: string | null;
}

export interface ApiHomeSection {
  total: number;
  items: ApiDesign[];
  hasMore: boolean;
  viewMoreUrl: string;
}

export interface ApiHomeData {
  latest: ApiHomeSection;
  today: ApiHomeSection;
  yesterday?: ApiHomeSection;
  /** Retained by the API for older app builds. New marketplace surfaces do not show future designs. */
  tomorrow?: ApiHomeSection;
  categories: Array<{
    id: string;
    name: string;
    total: number;
    items: ApiDesign[];
    hasMore: boolean;
    viewMoreUrl: string;
  }>;
}

export interface ApiImageSearchResult extends ApiDesign {
  similarityScore: number;
  similarityLabel: 'Very close' | 'Similar' | 'Related' | string;
}

export interface ApiImageSearchData {
  engine: string;
  minimumSimilarity: number;
  results: ApiImageSearchResult[];
}

export interface ApiFolderFile {
  id: string;
  name: string;
  relativePath: string;
  extension: string | null;
  mimeType: string | null;
  size: number;
  previewUri: string | null;
}

export interface ApiFolder {
  id: string;
  name: string;
  pricePaise: number;
  currency: 'INR' | string;
  fileCount: number;
  totalSize: number;
  coverImageUri: string | null;
  zipName?: string | null;
  files?: ApiFolderFile[];
  createdAt: string | null;
  updatedAt: string | null;
}

export type ApiCatalogFile = ApiFolderFile;
export type ApiCatalog = ApiFolder;

export interface BrowseMachineType {
  id: string;
  name: string;
  machineId?: string | null;
  categoryIds: string[];
}

export interface BrowseMachine {
  id: string;
  name: string;
  imageUri: string | null;
  machineTypeIds: string[];
}

export interface BrowseCategory {
  id: string;
  name: string;
  machineTypeIds: string[];
  designTypeIds: string[];
}

export interface BrowseDesignType {
  id: string;
  name: string;
  categoryIds: string[];
}

export interface BrowseFilters {
  machines: BrowseMachine[];
  machineTypes: BrowseMachineType[];
  categories: BrowseCategory[];
  designTypes: BrowseDesignType[];
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number | null;
  to: number | null;
}

export interface PaginationLinks {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
}

export interface ApiEnvelope<T> {
  success: true;
  message: string;
  data: T;
}

export interface PaginatedEnvelope<T> extends ApiEnvelope<T> {
  meta: PaginationMeta;
  links: PaginationLinks;
}

export interface DesignCardData {
  id: string;
  title: string;
  category: string;
  machine: string;
  stitches: number;
  heightMm: number;
  widthMm: number;
  price: number;
  images: string[];
  createdAt: string;
  description: string;
  sellerName: string;
  sellerAvatar: string | null;
  formats: string[];
  isNew?: boolean;
}

export interface FolderCardData {
  id: string;
  title: string;
  category: string;
  price: number;
  designCount: number;
  coverImage: string | null;
  description: string;
}
