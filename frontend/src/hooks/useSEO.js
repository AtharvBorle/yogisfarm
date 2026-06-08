import { useEffect } from 'react';
import api from '../api';

let cachedSettingsPromise = null;

const getSettings = () => {
  if (!cachedSettingsPromise) {
    cachedSettingsPromise = api.get('/settings')
      .then(res => {
        if (res.data.status && res.data.settings) {
          return res.data.settings;
        }
        return null;
      })
      .catch(err => {
        cachedSettingsPromise = null; // Allow retrying on failure
        throw err;
      });
  }
  return cachedSettingsPromise;
};

export const useSEO = (seoData) => {
  const isString = typeof seoData === 'string';
  const depKey = isString ? seoData : (seoData?.key || '');
  const depTitle = isString ? '' : (seoData?.title || '');
  const depDesc = isString ? '' : (seoData?.description || '');
  const depKeywords = isString ? '' : (seoData?.keywords || '');
  const depOgImage = isString ? '' : (seoData?.ogImage || '');

  useEffect(() => {
    const updateSEO = async () => {
      let title = '';
      let description = '';
      let keywords = '';
      let ogImage = '';

      if (isString) {
        if (depKey) {
          try {
            const settings = await getSettings();
            if (settings) {
              title = settings[`seo_${depKey}_title`] || '';
              description = settings[`seo_${depKey}_description`] || '';
              keywords = settings[`seo_${depKey}_keywords`] || '';
              ogImage = settings[`seo_${depKey}_og_image`] || '';
            }
          } catch (err) {
            console.error('Failed to load SEO settings', err);
          }
        }
      } else if (seoData && typeof seoData === 'object') {
        if (depKey) {
          try {
            const settings = await getSettings();
            if (settings) {
              title = settings[`seo_${depKey}_title`] || depTitle || '';
              description = settings[`seo_${depKey}_description`] || depDesc || '';
              keywords = settings[`seo_${depKey}_keywords`] || depKeywords || '';
              ogImage = settings[`seo_${depKey}_og_image`] || depOgImage || '';
            } else {
              title = depTitle;
              description = depDesc;
              keywords = depKeywords;
              ogImage = depOgImage;
            }
          } catch (err) {
            console.error('Failed to load SEO settings', err);
            title = depTitle;
            description = depDesc;
            keywords = depKeywords;
            ogImage = depOgImage;
          }
        } else {
          title = depTitle;
          description = depDesc;
          keywords = depKeywords;
          ogImage = depOgImage;
        }
      }

      // Update or Create Page Title
      let titleTag = document.querySelector('title');
      if (title) {
        if (!titleTag) {
          titleTag = document.createElement('title');
          document.head.appendChild(titleTag);
        }
        titleTag.innerText = title;
      }

      // Update or Create Meta Description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (description) {
        if (!metaDesc) {
          metaDesc = document.createElement('meta');
          metaDesc.name = 'description';
          if (titleTag) {
            titleTag.parentNode.insertBefore(metaDesc, titleTag.nextSibling);
          } else {
            document.head.appendChild(metaDesc);
          }
        }
        metaDesc.content = description;
      }

      // Update or Create Meta Property Description
      let metaPropDesc = document.querySelector('meta[property="description"]');
      if (description) {
        if (!metaPropDesc) {
          metaPropDesc = document.createElement('meta');
          metaPropDesc.setAttribute('property', 'description');
          if (metaDesc) {
            metaDesc.parentNode.insertBefore(metaPropDesc, metaDesc.nextSibling);
          } else if (titleTag) {
            titleTag.parentNode.insertBefore(metaPropDesc, titleTag.nextSibling);
          } else {
            document.head.appendChild(metaPropDesc);
          }
        }
        metaPropDesc.content = description;
      }

      // Update or Create Meta Keywords
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (keywords) {
        if (!metaKeywords) {
          metaKeywords = document.createElement('meta');
          metaKeywords.name = 'keywords';
          const insertAnchor = metaPropDesc || metaDesc || titleTag;
          if (insertAnchor) {
            insertAnchor.parentNode.insertBefore(metaKeywords, insertAnchor.nextSibling);
          } else {
            document.head.appendChild(metaKeywords);
          }
        }
        metaKeywords.content = keywords;
      }

      // Update or Create Meta Property OG Image
      let metaOgImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) {
        if (!metaOgImage) {
          metaOgImage = document.createElement('meta');
          metaOgImage.setAttribute('property', 'og:image');
          const insertAnchor = metaKeywords || metaPropDesc || metaDesc || titleTag;
          if (insertAnchor) {
            insertAnchor.parentNode.insertBefore(metaOgImage, insertAnchor.nextSibling);
          } else {
            document.head.appendChild(metaOgImage);
          }
        }
        let absOgImage = ogImage;
        if (ogImage && !ogImage.startsWith('http://') && !ogImage.startsWith('https://')) {
          const origin = window.location.origin;
          absOgImage = `${origin}${ogImage.startsWith('/') ? '' : '/'}${ogImage}`;
        }
        metaOgImage.content = absOgImage;
      }
    };

    updateSEO();
  }, [isString, depKey, depTitle, depDesc, depKeywords, depOgImage]);
};

export default useSEO;
