import type {
  ApiDesign,
  ApiFolder,
  BrowseFilters,
  DesignCardData,
  FolderCardData,
} from '../types/marketplace';

export const normalizeAssetUrl = (value: string | null | undefined) => {
  if (!value) return null;
  return value.replace(/([^:]\/)\/+/g, '$1');
};

const numberValue = (value: string | number | null | undefined) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const toDesignCard = (design: ApiDesign, filters?: BrowseFilters | null): DesignCardData => {
  const variants = design.designTypes ?? [];
  const machine = filters?.machineTypes.find((item) => item.id === design.machineTypeId)?.name
    ?? design.machineTypeId
    ?? 'Machine not specified';
  const images = design.images
    .map((image) => normalizeAssetUrl(image.thumbnailUri || image.uri))
    .filter((uri): uri is string => Boolean(uri));
  const fallbackImage = normalizeAssetUrl(design.imageUri);
  if (images.length === 0 && fallbackImage) images.push(fallbackImage);

  return {
    id: design.id,
    title: design.title,
    category: design.categoryName || 'Uncategorized',
    machine,
    stitches: variants.reduce((total, variant) => total + numberValue(variant.details.stitchCount), 0),
    heightMm: numberValue(variants[0]?.details.height),
    widthMm: numberValue(variants[0]?.details.width),
    price: design.pricePaise / 100,
    images,
    createdAt: design.createdAt || design.publishDate || '',
    isNew: Boolean(design.publishDate && Date.now() - new Date(design.publishDate).getTime() < 14 * 86400000),
  };
};

export const toFolderCard = (folder: ApiFolder): FolderCardData => ({
  id: folder.id,
  title: folder.name,
  category: 'Design folder',
  price: folder.pricePaise / 100,
  designCount: folder.fileCount,
  coverImage: normalizeAssetUrl(folder.coverImageUri),
  description: `${folder.fileCount.toLocaleString('en-IN')} extracted file${folder.fileCount === 1 ? '' : 's'} in this archive.`,
});

export const formatBytes = (bytes: number) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};
