import React, { RefObject } from "react";
import { X } from "react-feather";

/**
 * TextField
 */
const TextField = (
  {
    children,
    className,
    ariaLabel,
    autoComplete,
    id,
    lines = 1,
    name,
    onChange,
    placeholder,
    type = "input",
    value,
    disabled,
    padding,
    inputClassName,
    inputRef,
    onKeyDown,
    height,
    ...props
  }: {
    className?: string;
    ariaLabel?: string;
    id: string;
    autoComplete?: string;
    lines?: number;
    name?: string;
    type?: "input" | "textarea";
    value?: any;
    disabled?: boolean;
    placeholder: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    inputRef?: RefObject<any>;
    padding?: string;
    inputClassName?: string;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    height?: string;
    children?:
    | (JSX.Element | HTMLElement | string | number)[]
    | JSX.Element
    | string
    | (string | Element)[];
  }
) => {
  let actualPadding = "0px 8px 0px 8px";
  if (type && type === "textarea") {
    actualPadding = "10px 8px 10px 8px";
  }
  if (padding) {
    actualPadding = padding;
  }

  let actualHeight = type && type === "textarea" ? `${lines * 20 + 30}px` : "46px"
  if (height) {
    actualHeight = height;
  }

  return (
    <div className={`textfield-container ${className ?? ""}`} {...props}>
      {type === "input" ? (
        <>
          <input
            className={`textfield-base ${inputClassName}`}
            onChange={onChange}
            placeholder={placeholder}
            ref={inputRef ?? undefined}
            value={value}
            disabled={disabled}
            onKeyDown={onKeyDown}
            autoComplete={autoComplete}
          />
          {children}
        </>

      ) : (
        <>
          <textarea
            className={`textfield-base ${inputClassName}`}
            onChange={onChange}
            placeholder={placeholder}
            value={value}
            ref={inputRef ?? undefined}
            disabled={disabled}
            onKeyDown={onKeyDown}
            autoComplete={autoComplete}
            style={{
              WebkitAppearance: 'none',
              lineHeight: '20px'
            }}
          />
          {children}
        </>
      )}
      <style jsx>{`
          .textfield-container {
            position: relative;
            display: flex;
            height: ${actualHeight};
            width: 100%;
            border: 1px solid #8b9199;
            border-radius: 4px;
            box-sizing: border-box;
            overflow: hidden;
            padding: ${actualPadding};

            background-color: ${disabled ? '#ebeef2' : '#fff'};
            ${disabled ? 'color: #8b9199;' : ''}
          }

          .textfield-container:focus-within {
            border: 2px solid #155da1;
            overflow: hidden;
          }

          .textfield-base:focus {
            outline: none;
          }

          .textfield-base {
            font-family: HKGrotesk;
            font-weight: 400;
            font-size: 14px;
            letter-spacing: 0.3px;
            line-height: 20px;
            color: #272a2d;
            width: 100%;
            outline: none;
            border: none;
            padding: 0;
            position: relative;
            margin: 0;
            background: transparent;
          }
          
          input.textfield-base {
            display: block;
            height: ${actualHeight};
            padding: ${actualPadding};
          }
          
          textarea.textfield-base {
            resize: none;
            -webkit-appearance: none;
            line-height: 20px;
            box-sizing: border-box;
            -webkit-text-size-adjust: 100%;
            display: block;
            -webkit-user-select: text;
            user-select: text;
          }

          .textfield-base:disabled {
            background-color: inherit;
            color: inherit;
          }
        `}</style>
    </div>
  );
}

export default TextField;
