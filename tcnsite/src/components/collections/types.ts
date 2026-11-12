export interface CollectionItem {
  id: string; title: string; image: string; alt: string; width: number; height: number;
  description?: string; rating?: number; sample?: boolean;
  sources?: { type: string; srcSet: string }[];
  srcSet?: string;
}
export interface CollectionData {
  sort?: string;
  coverAspectRatio?: { width: number; height: number };
  discoveryId: string; eyebrow: string; title: string; description: string;
  assetDirectory: string; emptyMessage: string; sampleNotice?: string; items: CollectionItem[];
}
