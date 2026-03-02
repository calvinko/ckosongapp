import React, { FormEvent, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Box, Flex, Text, TextField, Button } from "./base";
import { getPursueAIConfig, streamChat, submitFeedback, FeedbackData } from "../lib/ai/aiClient";
import { CheckCircle, Copy, ThumbsDown, ThumbsUp } from "react-feather";
import toast, { CheckmarkIcon } from "react-hot-toast";
import { set } from "mongoose";

function TypingIndicator(): JSX.Element {
  return (
    <>
      <span className="loading-dots inline-flex align-bottom ml-0.5" aria-hidden>
        <span>.</span>
        <span>.</span>
        <span>.</span>
      </span>
      <style jsx>{`
        .loading-dots span {
          animation: loading-dot 0.6s ease-in-out infinite both;
        }
        .loading-dots span:nth-child(2) {
          animation-delay: 0.15s;
        }
        .loading-dots span:nth-child(3) {
          animation-delay: 0.3s;
        }
        @keyframes loading-dot {
          0%, 80%, 100% {
            opacity: 0.25;
            transform: translateY(0);
          }
          40% {
            opacity: 1;
            transform: translateY(-3px);
          }
        }
      `}</style>
    </>
  );
}

export default function AiQuestion(): JSX.Element {
  const [isFeedbackGiven, setIsFeedbackGiven] = useState(false);
  const [question, setQuestion] = useState("");
  const [streamedAnswer, setStreamedAnswer] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [traceId, setTraceId] = useState<string | null>(null);
  // Ref so the Stop button can abort the in-flight fetch
  const abortRef = useRef<AbortController | null>(null);

  const handleSubmit = async () => {
    const q = question.trim();
    if (!q || isStreaming) return;

    const config = getPursueAIConfig();
    if (!config) {
      setStreamedAnswer("Set NEXT_PUBLIC_PURSUE_AI_BASE_URL (or NEXT_PUBLIC_PURSUEAI_API_URL) to enable AI.");
      return;
    }

    setStreamedAnswer("");
    setIsStreaming(true);
    setIsFeedbackGiven(false);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      // onChunk is called with the full accumulated text on each streamed chunk, so we can pass setStreamedAnswer directly
      const responseTraceId = await streamChat(q, [], {
        signal: controller.signal,
        onChunk: setStreamedAnswer,
      });
      setTraceId(responseTraceId);
      console.log("AI response trace ID:", responseTraceId);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setStreamedAnswer((err as Error).message ?? "Could not connect. Please try again.");
    } finally {
      abortRef.current = null;
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  const handleFeedback = async (feedbackType: string) => {
    try {
      const feedbackData: FeedbackData = {
        trace_id: traceId || "",
        question: question,
        response: streamedAnswer,
        rating: feedbackType as "positive" | "negative",
        comment: null,
      };
      await submitFeedback(feedbackData);
      toast.success("Feedback sent. Thank you!");
    } catch (err) {
      toast.error("Could not send feedback. " + (err as Error).message);
    }
  }

  // Show answer area when we have content or are still waiting for the first chunk
  const showAnswer = streamedAnswer || isStreaming;
  // Animated dots only while waiting for the first chunk; hide once any text has arrived
  const showDots = isStreaming && !streamedAnswer;

  return (
    <Box className="w-full">
      <Flex className="flex-wrap items-stretch gap-2 w-full" flexDirection="row">
        <Box className="flex-1 min-w-0">
          <TextField
            id="ai-question-input"
            placeholder="Ask a question to find hymns..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </Box>
        <Flex className="shrink-0 items-center">
          {isStreaming ? (
            <Button
              onClick={() => abortRef.current?.abort()}
              type="medium"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl !p-0 bg-gray-600 text-white hover:bg-gray-500"
            >
              <svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 24 24">
                <path d="M7 5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7Z" />
              </svg>
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              type="medium"
              disabled={!question.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl !p-0 disabled:opacity-30"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
              </svg>
            </Button>
          )}
        </Flex>
      </Flex>

      {showAnswer ?
        (
          <Flex className="mt-4 gap-y-3" flexDirection="column">
            <Box className="p-3 border border-[#ebeef2] rounded-md w-full bg-white">
              <div className="text-[#272a2d] text-sm leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_a]:text-[#155da1] [&_a]:underline">
                <ReactMarkdown>{streamedAnswer}</ReactMarkdown>
                {showDots && <TypingIndicator />}
              </div>
            </Box>
            {
              !isStreaming &&
              <Flex className="gap-x-4 pl-1" flexDirection="row">
                <CopyButton text={streamedAnswer} />
                <div className="h-4 w-px bg-gray-500" />
                <FeedbackButtons isFeedbackGiven={isFeedbackGiven} handleFeedback={handleFeedback} />
              </Flex>
            }
          </Flex>
        ) : null
      }

      <Text as="p" fontSize="12px" color="#8B9199" className="ml-0.5 mt-2" lineHeight="1.2">
        AI makes mistakes. Verify important information.
      </Text>
    </Box>
  );
}

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-gray-500 transition hover:text-gray-300"
    >
      {copied ? (
        <>
          <CheckCircle className="w-4 h-4 text-gray-500" />
          <span className="text-xs text-gray-500 ml-0.5 leading-1">
            Copied!
          </span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4 text-gray-500 " />
          <span className="text-xs text-gray-500 ml-0.5 leading-1">
            Copy
          </span>
        </>
      )}
    </button>
  );
}

const FeedbackButtons = ({ isFeedbackGiven, handleFeedback }) => {
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [feedbackTypeGiven, setFeedbackTypeGiven] = useState('');

  useEffect(() => {
    setFeedbackGiven(isFeedbackGiven);
    setFeedbackTypeGiven("");
  }, [isFeedbackGiven])

  const onFeedbackClick = (feedbackType: string) => {
    setFeedbackGiven(true);
    setFeedbackTypeGiven(feedbackType);
    handleFeedback(feedbackType);
  }

  return (
    <Flex className="gap-x-4 items-center" flexDirection="row">
      {!feedbackGiven ?
        <Flex className="gap-x-4 items-center" flexDirection="row">
          <ThumbsUp
            className="w-4 h-4 text-gray-500 cursor-pointer hover:text-gray-300"
            onClick={() => onFeedbackClick('positive')}
          />
          <ThumbsDown
            className="w-4 h-4 text-gray-500 cursor-pointer hover:text-gray-300"
            onClick={() => onFeedbackClick('negative')}
          />
        </Flex>
        :
        <Flex className="gap-x-2 items-center" flexDirection="row">
          {feedbackTypeGiven === 'positive' ? (
            <ThumbsUp
              className="w-4 h-4 text-[#008236]"
            />
          ) : (
            <ThumbsDown
              className="w-4 h-4 text-[#c10007]"
            />
          )}
          <Text fontSize="12px" color={feedbackTypeGiven === 'positive' ? '#008236' : '#c10007'} lineHeight="1">
            Thanks for your feedback!
          </Text>
        </Flex>
      }
    </Flex>
  )
}
