import { Lightbulb, Volume2 } from "lucide-react";
import React, { useEffect, useState } from "react";
interface QuestionSectionProps {
  mockInterviewQuestion: any; // Define the appropriate type based on your JSON structure
}
function QuestionSection<QuestionSectionProps>({
  mockInterviewQuestion,
  activeQuestionIndex,
}: any) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const textToSpeech = (text: string) => {
    if ("speechSynthesis" in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const speech = new SpeechSynthesisUtterance(text);
        speech.onend = () => {
          setIsSpeaking(false);
        };
        window.speechSynthesis.speak(speech);
        setIsSpeaking(true);
      }
    } else {
      alert("Sorry, your browser doesn't support text to speech");
    }
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel(); // Cleanup speech synthesis on component unmount
    };
  }, []);

  return (
    mockInterviewQuestion && (
      <div className="p-5 border rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {mockInterviewQuestion &&
            mockInterviewQuestion.map((data, index) => (
              <h2
                key={index}
                className={`bg-secondary rounded-full p-2 text-center text-xs md:text-sm cursor pointer ${
                  activeQuestionIndex == index && "bg-blue-700 text-white "
                }`}
              >
                Question #{index + 1}
              </h2>
            ))}
        </div>

        <h2 className="my-5 text-md md:text-lg">
          {mockInterviewQuestion[activeQuestionIndex].question}
        </h2>
        <Volume2
          onClick={() =>
            textToSpeech(mockInterviewQuestion[activeQuestionIndex].question)
          }
          className="mb-5 cursor-pointer"
        />

        <div className="border rounded-lg p-5 bg-blue-100">
          <h2 className="flex gap-5 items-center text-blue-700">
            <Lightbulb />
            <strong>Note:</strong>
          </h2>
          <h2 className="my-5 text-blue-700">
            {process.env.NEXT_PUBLIC_QUESTION_NOTE}
          </h2>
        </div>
      </div>
    )
  );
}

export default QuestionSection;
