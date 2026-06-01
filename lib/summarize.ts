import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "https://medical-news.vercel.app",
    "X-Title": "질병 정보 모니터",
  },
});

export async function summarizeArticle(
  title: string,
  description: string
): Promise<string> {
  const response = await client.chat.completions.create({
    model: "openrouter/auto",
    messages: [
      {
        role: "system",
        content:
          "당신은 의료/보건 뉴스 전문 번역 및 요약 AI입니다. 영문 질병·보건 기사를 한국 독자를 위해 2~3문장으로 간결하게 한국어로 요약하세요. 핵심 정보(병명, 발생 지역, 현황, 주의사항)를 포함하세요. 추가 설명 없이 요약문만 출력하세요.",
      },
      {
        role: "user",
        content: `제목: ${title}\n\n내용: ${description || "내용 없음"}`,
      },
    ],
    max_tokens: 300,
    temperature: 0.3,
  });

  return response.choices[0]?.message?.content?.trim() ?? "";
}
