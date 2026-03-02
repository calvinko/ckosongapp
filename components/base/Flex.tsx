import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

/**
 * A Flex Component
 * 
 * Use tailwind class names for most flex properties: https://tailwindcss.com/docs/flex-basis
 * For documentation: https://css-tricks.com/snippets/css/a-guide-to-flexbox/
 */
const Flex = ({
  children,
  className,
  flexDirection,
  m,
  style,
  ...props
}: {
  className?: string;
  flexDirection?: string;
  m?: string;
  style?: React.CSSProperties;
  children?:
  | (JSX.Element | HTMLElement | string | number | null | boolean | undefined | Element | Element[] | ReactNode)[]
  | JSX.Element
  | Element
  | undefined
  | string
  | (string | Element)[]
  | null
  | any
}): JSX.Element => {
  let classNamesList: string[] = [];

  // handle flexDirection
  switch (flexDirection) {
    case "row":
      classNamesList.push("flex-row");
      break;
    case "row-reverse":
      classNamesList.push("flex-row-reverse");
      break;
    case "column":
      classNamesList.push("flex-col");
      break;
    case "column-reverse":
      classNamesList.push("flex-col-reverse");
      break;
    default:
      break;
  }

  const finalClassNames = twMerge(classNamesList.join(' '), className ?? "")

  return (
    <div className={`flex flex-element ${finalClassNames}`} {...props} style={style}>
      {children}
      <style jsx>{`
        .flex-element {
          ${m ? `margin: ${m};` : ""}
        }
      `}</style>
    </div>
  )
}

export default Flex;