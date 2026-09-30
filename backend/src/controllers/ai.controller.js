import { generateAIText } from "../services/ai/ai.service.js";

export const testAI = async (req, res) => {
  try {
    const result = await generateAIText(
      "Generate one short technical interview question for a beginner Software Developer."
    );

    return res.status(200).json({
      success: true,
      data: {
        response: result,
      },
    });
  } catch (error) {
    console.error("AI test error:", error);

    return res.status(500).json({
      success: false,
      message: "AI service test failed.",
    });
  }
};