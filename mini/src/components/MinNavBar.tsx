import react from "react";
import { Link } from "react-router-dom";
import MinFeedback from "./MinFeedback";

/**
 * Navigation Bar for mini app
 */
const NavBar = () => {
  return (
    <div className="w-full pb-2">
      <div className="flex flex-row">
        <div className="flex-1">
          <Link
            to="/"
            className="pb-3 text-base underline underline-offset-1 text-base-blue"
          >
            Home
          </Link>
        </div>
        <div className="flex items-end pr-2 sm:p-0">
          <MinFeedback />
        </div>
      </div>
    </div>
  );
};

export default NavBar;
