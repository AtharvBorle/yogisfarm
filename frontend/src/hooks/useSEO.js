import { useEffect } from 'react';
import api from '../api';

export const useSEO = (seoData) => {
  useEffect(() => {
    const updateSEO = async () => {
      let title = '';
      let description = '';
      let keywords = '';

      if (typeof seoData === 'string') {
        try {
          const res = await api.get('/settings');
          if (res.data.status && res.data.settings) {
            const settings = res.data.settings;
            title = settings[`seo_${seoData}_title`] || '';
            description = settings[`seo_${seoData}_description`] || '';
            keywords = settings[`seo_${seoData}_keywords`] || '';
          }
        } catch (err) {
          console.error('Failed to load SEO settings', err);
        }
      } else if (seoData && typeof seoData === 'object') {
        if (seoData.key) {
          try {
            const res = await api.get('/settings');
            if (res.data.status && res.data.settings) {
              const settings = res.data.settings;
              title = settings[`seo_${seoData.key}_title`] || seoData.title || '';
              description = settings[`seo_${seoData.key}_description`] || seoData.description || '';
              keywords = settings[`seo_${seoData.key}_keywords`] || seoData.keywords || '';
            } else {
              title = seoData.title || '';
              description = seoData.description || '';
              keywords = seoData.keywords || '';
            }
          } catch (err) {
            console.error('Failed to load SEO settings', err);
            title = seoData.title || '';
            description = seoData.description || '';
            keywords = seoData.keywords || '';
          }
        } else {
          title = seoData.title || '';
          description = seoData.description || '';
          keywords = seoData.keywords || '';
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
    };

    updateSEO();
  }, [seoData]);
};

export default useSEO;
