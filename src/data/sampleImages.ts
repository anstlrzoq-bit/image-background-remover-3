import { SampleImage } from '../types';

export const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: 'portrait',
    title: '인물 프로필',
    category: 'Portrait',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: 'product',
    title: '상품 (운동화)',
    category: 'Product',
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: 'pet',
    title: '반려동물 (강아지)',
    category: 'Pet',
    url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: 'food',
    title: '음식 (버거)',
    category: 'Food',
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=200&auto=format&fit=crop'
  }
];

export const BACKGROUND_PRESETS = [
  { id: 'transparent', name: '투명 배경', type: 'transparent', value: 'transparent' },
  { id: 'white', name: '화이트 (증명/쇼핑몰)', type: 'color', value: '#ffffff' },
  { id: 'black', name: '블랙 (시크)', type: 'color', value: '#111827' },
  { id: 'soft-blue', name: '파스텔 블루', type: 'color', value: '#e0f2fe' },
  { id: 'studio-gray', name: '스튜디오 그레이', type: 'color', value: '#f3f4f6' },
  { id: 'warm-cream', name: '따뜻한 크림', type: 'color', value: '#fef3c7' },
  { id: 'rose', name: '소프트 로즈', type: 'color', value: '#ffe4e6' },
  { id: 'mint', name: '소프트 민트', type: 'color', value: '#dcfce7' },
] as const;
