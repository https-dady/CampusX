import { useCallback, useState } from "react";

import {
  addResumeBuilderItem,
  createEmptyResumeBuilderData,
  createResumeBuilderDataFromAnalysis,
  normalizeResumeBuilderData,
  removeResumeBuilderItem,
  setResumeBuilderTemplate,
  updateResumeBuilderItem,
  updateResumeBuilderSection,
} from "../utils/resumeBuilder.model.js";

export const useResumeBuilder = (
  initialAnalysis = null
) => {
  const [resumeData, setResumeData] = useState(() => {
    if (initialAnalysis) {
      return createResumeBuilderDataFromAnalysis(
        initialAnalysis
      );
    }

    return createEmptyResumeBuilderData();
  });

  const updateSection = useCallback(
    (section, value) => {
      setResumeData((current) =>
        updateResumeBuilderSection(
          current,
          section,
          value
        )
      );
    },
    []
  );

  const addItem = useCallback(
    (section, item = {}) => {
      setResumeData((current) =>
        addResumeBuilderItem(
          current,
          section,
          item
        )
      );
    },
    []
  );

  const updateItem = useCallback(
    (section, index, field, value) => {
      /*
       * ResumeBuilder supports both forms:
       *
       * 1. updateItem(
       *      "education",
       *      0,
       *      "degree",
       *      "B.Tech"
       *    )
       *
       * 2. updateItem(
       *      "education",
       *      0,
       *      {
       *        degree: "B.Tech",
       *        branch: "AI & DS"
       *      }
       *    )
       *
       * 3. Simple array item:
       *
       *    updateItem(
       *      "certifications",
       *      0,
       *      "React Certification"
       *    )
       */

      setResumeData((current) => {
        const currentSection =
          Array.isArray(current?.[section])
            ? current[section]
            : [];

        if (
          index < 0 ||
          index >= currentSection.length
        ) {
          return current;
        }

        /*
         * Object patch:
         *
         * updateItem(
         *   section,
         *   index,
         *   { field: value }
         * )
         */
        if (
          field !== null &&
          typeof field === "object" &&
          !Array.isArray(field)
        ) {
          const currentItem =
            currentSection[index];

          const updatedItem =
            currentItem !== null &&
            typeof currentItem === "object" &&
            !Array.isArray(currentItem)
              ? {
                  ...currentItem,
                  ...field,
                }
              : {
                  ...field,
                };

          return {
            ...current,
            [section]: currentSection.map(
              (item, itemIndex) =>
                itemIndex === index
                  ? updatedItem
                  : item
            ),
          };
        }

        /*
         * Simple array item replacement:
         *
         * updateItem(
         *   "certifications",
         *   0,
         *   "React Certification"
         * )
         *
         * In this case `value` is undefined.
         */
        if (
          value === undefined
        ) {
          return {
            ...current,
            [section]: currentSection.map(
              (item, itemIndex) =>
                itemIndex === index
                  ? field
                  : item
            ),
          };
        }

        /*
         * Traditional field/value update:
         *
         * updateItem(
         *   "education",
         *   0,
         *   "degree",
         *   "B.Tech"
         * )
         */
        return updateResumeBuilderItem(
          current,
          section,
          index,
          field,
          value
        );
      });
    },
    []
  );

  const removeItem = useCallback(
    (section, index) => {
      setResumeData((current) =>
        removeResumeBuilderItem(
          current,
          section,
          index
        )
      );
    },
    []
  );

  const changeTemplate = useCallback(
    (templateId) => {
      setResumeData((current) =>
        setResumeBuilderTemplate(
          current,
          templateId
        )
      );
    },
    []
  );

  const replaceData = useCallback((data) => {
    setResumeData(
      normalizeResumeBuilderData(data)
    );
  }, []);

  const loadFromAnalysis = useCallback(
    (analysisResult) => {
      setResumeData(
        createResumeBuilderDataFromAnalysis(
          analysisResult
        )
      );
    },
    []
  );

  const reset = useCallback(() => {
    setResumeData(
      createEmptyResumeBuilderData()
    );
  }, []);

  return {
    resumeData,
    updateSection,
    addItem,
    updateItem,
    removeItem,
    changeTemplate,
    replaceData,
    loadFromAnalysis,
    reset,
  };
};

export default useResumeBuilder;