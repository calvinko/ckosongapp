import React from "react"

/**
 * A Green or Red Circle Icon
 * 
 * isGreen: boolean - true is green, false is red
 */
const GreenRedCircle = ({ isGreen }: { isGreen?: boolean }) => {
  return (
    <>
      {isGreen ? (
        <svg viewBox="0 0 22 23" className="circle-holder">
          <g stroke="none" strokeWidth="1" fill="none">
            <g
              transform="translate(-44.000000, -1006.000000)"
              fill="#91E43C"
              stroke="#75C920"
              strokeWidth="2"
            >
              <circle
                id="complete"
                cx="55.000495"
                cy="1017.5005"
                r="10.000495"
              ></circle>
            </g>
          </g>
        </svg>
      ) :
        <svg viewBox="0 0 20 21" className="circle-holder">
          <g
            id="Page-1"
            stroke="none"
            strokeWidth="1"
            fill="none"
            fillRule="evenodd"
          >
            <g
              id="4"
              transform="translate(-44.000000, -1123.000000)"
              fill="#FD7D7F"
              fillRule="nonzero"
              stroke="#D74F51"
              strokeWidth="2"
            >
              <rect
                id="pending"
                x="45"
                y="1124.27435"
                width="18.00099"
                height="18"
                rx="2"
              ></rect>
            </g>
          </g>
        </svg>
      }
      <style jsx>{`
        .circle-holder {
          align-self: center;
          padding: 0;
          margin: 0;
          height: 8px;
          width: 8px;
        }
    `}</style>
    </>
  )
}

export default GreenRedCircle;