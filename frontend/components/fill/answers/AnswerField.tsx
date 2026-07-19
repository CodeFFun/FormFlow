"use client";

import {
  ShortTextAnswer,
  LongTextAnswer,
  EmailAnswer,
  NumberAnswer,
  DateAnswer,
} from "./TextAnswers";
import {
  MultipleChoiceAnswer,
  CheckboxAnswer,
  DropdownAnswer,
} from "./ChoiceAnswers";
import { RatingAnswer } from "./RatingAnswer";
import { FileUploadAnswer } from "./FileUploadAnswer";
import type { AnswerFieldProps } from "./types";

interface DispatchProps extends AnswerFieldProps {
  formId: string;
  allowFileUpload?: boolean;
}

export function AnswerField({ allowFileUpload = true, formId, ...props }: DispatchProps) {
  switch (props.question.type) {
    case "short_text":
      return <ShortTextAnswer {...props} />;
    case "long_text":
      return <LongTextAnswer {...props} />;
    case "email":
      return <EmailAnswer {...props} />;
    case "number":
      return <NumberAnswer {...props} />;
    case "date":
      return <DateAnswer {...props} />;
    case "multiple_choice":
      return <MultipleChoiceAnswer {...props} />;
    case "checkbox":
      return <CheckboxAnswer {...props} />;
    case "dropdown":
      return <DropdownAnswer {...props} />;
    case "rating":
      return <RatingAnswer {...props} />;
    case "file_upload":
      return (
        <FileUploadAnswer {...props} formId={formId} enabled={allowFileUpload} />
      );
    default:
      return <ShortTextAnswer {...props} />;
  }
}
