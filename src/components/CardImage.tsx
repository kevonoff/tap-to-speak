import React from 'react';
import { Image } from 'react-native';
import { SvgXml } from 'react-native-svg';

interface CardImageProps {
  uri: string;
}

// Built-in symbols are inline SVG data URIs (react-native's <Image> can't
// rasterize SVG), so those are decoded and handed to react-native-svg.
// User photos are file:// URIs and render through the normal <Image>.
export const CardImage: React.FC<CardImageProps> = ({ uri }) => {
  if (uri.startsWith('data:image/svg+xml')) {
    const encoded = uri.slice(uri.indexOf(',') + 1);
    let xml = encoded;
    try {
      xml = decodeURIComponent(encoded);
    } catch {
      // Fall through with raw string if decoding fails
    }
    return <SvgXml xml={xml} width="100%" height="100%" />;
  }

  return (
    <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
  );
};
