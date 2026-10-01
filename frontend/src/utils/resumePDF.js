const sanitizeFileName = (value) => {
  const normalized = String(value || "resume")
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return normalized || "resume";
};

/* -------------------------------------------------------------------------- */
/* Color helpers                                                               */
/* -------------------------------------------------------------------------- */

const clamp = (value, min = 0, max = 1) => {
  return Math.min(
    max,
    Math.max(min, value)
  );
};

const parseNumber = (value) => {
  const number = Number.parseFloat(value);

  return Number.isFinite(number)
    ? number
    : 0;
};

const parsePercentageOrNumber = (
  value,
  percentageScale = 1
) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();

  if (normalized.endsWith("%")) {
    return (
      parseNumber(normalized.slice(0, -1)) /
      100
    );
  }

  return (
    parseNumber(normalized) /
    percentageScale
  );
};

const parseLightness = (value) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();

  if (normalized === "none") {
    return 0.5;
  }

  if (normalized.endsWith("%")) {
    return clamp(
      parseNumber(
        normalized.slice(0, -1)
      ) / 100
    );
  }

  return clamp(parseNumber(normalized));
};

const parseChroma = (value) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();

  if (normalized === "none") {
    return 0;
  }

  return Math.max(
    0,
    parseNumber(normalized)
  );
};

const parseHue = (value) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();

  if (
    !normalized ||
    normalized === "none"
  ) {
    return 0;
  }

  const hue = parseNumber(normalized);

  return Number.isFinite(hue)
    ? hue
    : 0;
};

const parseAlpha = (value) => {
  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  ) {
    return 1;
  }

  const normalized = String(value)
    .trim()
    .toLowerCase();

  if (normalized.endsWith("%")) {
    return clamp(
      parseNumber(
        normalized.slice(0, -1)
      ) / 100
    );
  }

  return clamp(
    parseNumber(normalized)
  );
};

const linearSrgbToSrgb = (value) => {
  if (value <= 0.0031308) {
    return 12.92 * value;
  }

  return (
    1.055 *
      Math.pow(
        Math.max(value, 0),
        1 / 2.4
      ) -
    0.055
  );
};

const oklchToRgba = (
  lightness,
  chroma,
  hue,
  alpha = 1
) => {
  const h =
    (hue * Math.PI) / 180;

  const a =
    chroma * Math.cos(h);

  const b =
    chroma * Math.sin(h);

  const lPrime =
    lightness +
    0.3963377774 * a +
    0.2158037573 * b;

  const mPrime =
    lightness -
    0.1055613458 * a -
    0.0638541728 * b;

  const sPrime =
    lightness -
    0.0894841775 * a -
    1.291485548 * b;

  const l =
    lPrime * lPrime * lPrime;

  const m =
    mPrime * mPrime * mPrime;

  const s =
    sPrime * sPrime * sPrime;

  const redLinear =
    4.0767416621 * l -
    3.3077115913 * m +
    0.2309699292 * s;

  const greenLinear =
    -1.2684380046 * l +
    2.6097574011 * m -
    0.3413193965 * s;

  const blueLinear =
    -0.0041960863 * l -
    0.7034186147 * m +
    1.707614701 * s;

  const red = clamp(
    linearSrgbToSrgb(redLinear)
  );

  const green = clamp(
    linearSrgbToSrgb(greenLinear)
  );

  const blue = clamp(
    linearSrgbToSrgb(blueLinear)
  );

  return `rgba(${Math.round(
    red * 255
  )}, ${Math.round(
    green * 255
  )}, ${Math.round(
    blue * 255
  )}, ${clamp(alpha)})`;
};

/*
 * Converts every oklch(...) expression into
 * rgba(...).
 *
 * This is retained as a safety layer for any
 * CSS text that survives the computed-style
 * conversion.
 */
const replaceOklchColors = (cssText) => {
  if (
    typeof cssText !== "string" ||
    !cssText.includes("oklch")
  ) {
    return cssText;
  }

  return cssText.replace(
    /oklch\(\s*([^)]*)\)/gi,
    (fullMatch, contents) => {
      try {
        const normalized =
          String(contents)
            .replace(/,/g, " ")
            .replace(/\s*\/\s*/g, " / ")
            .trim();

        const alphaParts =
          normalized.split(/\s*\/\s*/);

        const colorPart =
          alphaParts[0] || "";

        const colorTokens =
          colorPart
            .trim()
            .split(/\s+/)
            .filter(Boolean);

        if (colorTokens.length < 3) {
          return "rgb(0 0 0)";
        }

        const lightness =
          parseLightness(
            colorTokens[0]
          );

        const chroma =
          parseChroma(
            colorTokens[1]
          );

        const hue =
          parseHue(
            colorTokens[2]
          );

        const alpha =
          alphaParts.length > 1
            ? parseAlpha(
                alphaParts[1]
              )
            : 1;

        return oklchToRgba(
          lightness,
          chroma,
          hue,
          alpha
        );
      } catch {
        return "rgb(0 0 0)";
      }
    }
  );
};

/* -------------------------------------------------------------------------- */
/* Computed-style isolation                                                    */
/* -------------------------------------------------------------------------- */

const COPY_STYLE_PROPERTIES = [
  "display",
  "position",
  "top",
  "right",
  "bottom",
  "left",
  "z-index",

  "width",
  "min-width",
  "max-width",
  "height",
  "min-height",
  "max-height",

  "box-sizing",
  "margin",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",

  "padding",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",

  "overflow",
  "overflow-x",
  "overflow-y",

  "flex",
  "flex-direction",
  "flex-wrap",
  "flex-grow",
  "flex-shrink",
  "flex-basis",
  "align-items",
  "align-content",
  "align-self",
  "justify-content",
  "justify-items",
  "justify-self",
  "gap",
  "row-gap",
  "column-gap",

  "grid-template-columns",
  "grid-template-rows",
  "grid-column",
  "grid-row",

  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "font-stretch",
  "line-height",
  "letter-spacing",
  "text-align",
  "text-transform",
  "text-decoration",
  "text-decoration-line",
  "text-decoration-color",
  "text-decoration-style",
  "text-indent",
  "white-space",
  "word-break",
  "overflow-wrap",

  "color",
  "background",
  "background-color",
  "background-image",
  "background-size",
  "background-position",
  "background-repeat",

  "border",
  "border-width",
  "border-style",
  "border-color",
  "border-top",
  "border-right",
  "border-bottom",
  "border-left",
  "border-radius",
  "border-top-left-radius",
  "border-top-right-radius",
  "border-bottom-right-radius",
  "border-bottom-left-radius",

  "box-shadow",

  "opacity",
  "visibility",

  "vertical-align",

  "fill",
  "stroke",
  "stroke-width",

  "transform",
  "transform-origin",

  "object-fit",
  "object-position",
];

const copyComputedStyles = (
  originalRoot,
  clonedRoot
) => {
  if (
    !originalRoot ||
    !clonedRoot
  ) {
    return;
  }

  const originalElements = [
    originalRoot,
    ...originalRoot.querySelectorAll("*"),
  ];

  const clonedElements = [
    clonedRoot,
    ...clonedRoot.querySelectorAll("*"),
  ];

  const count = Math.min(
    originalElements.length,
    clonedElements.length
  );

  for (let index = 0; index < count; index += 1) {
    const originalElement =
      originalElements[index];

    const clonedElement =
      clonedElements[index];

    if (
      !originalElement ||
      !clonedElement
    ) {
      continue;
    }

    let computedStyle;

    try {
      computedStyle =
        window.getComputedStyle(
          originalElement
        );
    } catch {
      continue;
    }

    for (
      const property of COPY_STYLE_PROPERTIES
    ) {
      try {
        const value =
          computedStyle.getPropertyValue(
            property
          );

        if (
          value &&
          value.trim()
        ) {
          clonedElement.style.setProperty(
            property,
            replaceOklchColors(value)
          );
        }
      } catch {
        // Ignore unsupported browser properties.
      }
    }

    /*
     * Make sure CSS variables cannot leak
     * oklch() into html2canvas.
     */
    for (
      let propertyIndex = 0;
      propertyIndex <
      computedStyle.length;
      propertyIndex += 1
    ) {
      const propertyName =
        computedStyle.item(
          propertyIndex
        );

      if (
        !propertyName ||
        !propertyName.startsWith("--")
      ) {
        continue;
      }

      try {
        const variableValue =
          computedStyle.getPropertyValue(
            propertyName
          );

        if (
          variableValue &&
          variableValue.includes(
            "oklch"
          )
        ) {
          clonedElement.style.setProperty(
            propertyName,
            replaceOklchColors(
              variableValue
            )
          );
        }
      } catch {
        // Ignore CSS custom property errors.
      }
    }
  }
};

/* -------------------------------------------------------------------------- */
/* Clone preparation                                                           */
/* -------------------------------------------------------------------------- */

const prepareCloneForPdf = (
  clonedDocument,
  originalElement
) => {
  /*
   * First, copy the browser's resolved
   * computed styles onto the cloned resume.
   *
   * This means html2canvas receives concrete
   * RGB/RGBA values instead of Tailwind's
   * OKLCH expressions.
   */
  if (
    originalElement &&
    clonedDocument
  ) {
    const clonedElement =
      clonedDocument.querySelector(
        "[data-resume-pdf-root='true']"
      );

    if (clonedElement) {
      copyComputedStyles(
        originalElement,
        clonedElement
      );
    }
  }

  /*
   * Remove stylesheets from the cloned
   * document. The resume already has its
   * computed styles inline at this point.
   *
   * This is the important part that prevents
   * html2canvas from parsing Tailwind's
   * oklch() declarations.
   */
  const styleNodes =
    clonedDocument.querySelectorAll(
      "style, link[rel='stylesheet']"
    );

  styleNodes.forEach((node) => {
    node.remove();
  });

  /*
   * Remove any remaining inline oklch()
   * expressions as a final safety layer.
   */
  const allElements =
    clonedDocument.querySelectorAll("*");

  allElements.forEach((element) => {
    const styleAttribute =
      element.getAttribute("style");

    if (
      styleAttribute &&
      styleAttribute.includes("oklch")
    ) {
      element.setAttribute(
        "style",
        replaceOklchColors(
          styleAttribute
        )
      );
    }
  });

  const pdfRoot =
    clonedDocument.querySelector(
      "[data-resume-pdf-root='true']"
    );

  if (!pdfRoot) {
    return;
  }

  pdfRoot.style.width = "210mm";
  pdfRoot.style.minWidth = "210mm";
  pdfRoot.style.maxWidth = "210mm";

  pdfRoot.style.minHeight = "297mm";

  pdfRoot.style.margin = "0";
  pdfRoot.style.transform = "none";
  pdfRoot.style.transformOrigin =
    "top left";

  pdfRoot.style.background =
    "#ffffff";

  pdfRoot.style.boxSizing =
    "border-box";

  /*
   * The live preview can be scaled with
   * transform. PDF export must never capture
   * that scale.
   */
  const descendants =
    pdfRoot.querySelectorAll("*");

  descendants.forEach(
    (element) => {
      element.style.transform =
        "none";
      element.style.transformOrigin =
        "top left";
    }
  );
};

/* -------------------------------------------------------------------------- */
/* Image handling                                                              */
/* -------------------------------------------------------------------------- */

const waitForImages = async (
  element
) => {
  if (!element) {
    return;
  }

  const images =
    Array.from(
      element.querySelectorAll("img")
    );

  if (images.length === 0) {
    return;
  }

  await Promise.all(
    images.map(
      (image) =>
        new Promise((resolve) => {
          if (image.complete) {
            resolve();
            return;
          }

          const timeout =
            window.setTimeout(
              resolve,
              15000
            );

          image.addEventListener(
            "load",
            () => {
              window.clearTimeout(
                timeout
              );

              resolve();
            },
            {
              once: true,
            }
          );

          image.addEventListener(
            "error",
            () => {
              window.clearTimeout(
                timeout
              );

              resolve();
            },
            {
              once: true,
            }
          );
        })
    )
  );
};

/* -------------------------------------------------------------------------- */
/* PDF export                                                                  */
/* -------------------------------------------------------------------------- */

export const downloadResumePdf = async ({
  element,
  fileName = "resume",
}) => {
  if (!(element instanceof HTMLElement)) {
    throw new Error(
      "Resume preview element was not found."
    );
  }

  const html2pdfModule =
    await import("html2pdf.js");

  const html2pdf =
    html2pdfModule.default ||
    html2pdfModule;

  if (
    typeof html2pdf !== "function"
  ) {
    throw new Error(
      "Unable to load the PDF generator."
    );
  }

  const safeFileName =
    sanitizeFileName(fileName);

  await waitForImages(element);

  const originalTransform =
    element.style.transform;

  const originalTransformOrigin =
    element.style.transformOrigin;

  const previewShell =
    element.closest(
      "[data-resume-preview-shell='true']"
    );

  const originalShellOverflow =
    previewShell?.style.overflow || "";

  const originalShellWidth =
    previewShell?.style.width || "";

  const originalShellHeight =
    previewShell?.style.height || "";

  const originalPdfAttribute =
    element.getAttribute(
      "data-resume-pdf-root"
    );

  try {
    /*
     * Remove live preview scaling.
     */
    element.style.transform =
      "none";

    element.style.transformOrigin =
      "top left";

    /*
     * Give html2canvas the real document
     * dimensions instead of the scaled viewport.
     */
    if (previewShell) {
      previewShell.style.overflow =
        "visible";

      previewShell.style.width =
        `${element.offsetWidth}px`;

      previewShell.style.height =
        `${element.scrollHeight}px`;
    }

    element.setAttribute(
      "data-resume-pdf-root",
      "true"
    );

    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(
          resolve
        );
      });
    });

    await html2pdf()
      .set({
        margin: 0,

        filename:
          `${safeFileName}.pdf`,

        image: {
          type: "jpeg",
          quality: 0.98,
        },

        html2canvas: {
          scale: 2,

          useCORS: true,

          allowTaint: false,

          backgroundColor:
            "#ffffff",

          logging: false,

          imageTimeout: 15000,

          /*
           * Critical:
           * pass the original element so
           * computed browser styles can be
           * copied into the cloned document.
           */
          onclone: (
            clonedDocument
          ) => {
            prepareCloneForPdf(
              clonedDocument,
              element
            );
          },
        },

        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
          compress: true,
        },

        pagebreak: {
          mode: [
            "css",
            "legacy",
          ],

          avoid: [
            ".resume-section",
            ".resume-item",
          ],
        },
      })
      .from(element)
      .save();
  } finally {
    element.style.transform =
      originalTransform;

    element.style.transformOrigin =
      originalTransformOrigin;

    if (previewShell) {
      previewShell.style.overflow =
        originalShellOverflow;

      previewShell.style.width =
        originalShellWidth;

      previewShell.style.height =
        originalShellHeight;
    }

    if (
      originalPdfAttribute ===
      null
    ) {
      element.removeAttribute(
        "data-resume-pdf-root"
      );
    } else {
      element.setAttribute(
        "data-resume-pdf-root",
        originalPdfAttribute
      );
    }
  }
};

export default downloadResumePdf;