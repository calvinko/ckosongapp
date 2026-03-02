import { twMerge } from "tailwind-merge";

/**
 * Box Component (div wrapper)
 */
const Box = (
  {
    children,
    className,
    width,
    ...props
  }: {
    className?: string;
    width?: string;
    children?:
    | (JSX.Element | HTMLElement | string | number | null | boolean | undefined | Element | Element[])[]
    | JSX.Element
    | Element
    | undefined
    | string
    | (string | Element)[]
    | null
    | any
  }
) => {
  const finalClassNames = twMerge(className ?? "")

  return (
    <div className={`box-element ${finalClassNames}`} {...props}>
      {children}
      <style jsx>{`
        .box-element {
          ${width ? "width: " + width + ";" : ""}
        }
      `}</style>
    </div>
  );
};

export default Box;
