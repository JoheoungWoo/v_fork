import { useCallback } from "react";
import { createSearchParams, useSearchParams } from "react-router-dom";
import useMove from "./useMove";

const getNum = (param, defaultValue) => {
  if (!param) return defaultValue;
  return parseInt(param);
};

const useCustomMove = (basePath) => {
  const move = useMove();
  const [queryParams] = useSearchParams();

  const page = getNum(queryParams.get("page"), 1);
  const size = getNum(queryParams.get("size"), 6);

  const queryDefault = createSearchParams({ page, size }).toString();

  const moveToList = useCallback(
    ({ page: pageParam, size: sizeParam } = {}) => {
      const pageNum = getNum(pageParam, page);
      const sizeNum = getNum(sizeParam, size);

      const queryStr = createSearchParams({
        page: pageNum,
        size: sizeNum,
      }).toString();

      move({ pathname: basePath, search: queryStr });
    },
    [move, page, size, basePath],
  );

  const moveToRead = useCallback(
    (num) => {
      move({
        pathname: `${basePath}/${num}`,
        search: queryDefault,
      });
    },
    [move, queryDefault, basePath],
  );

  return { moveToList, moveToRead, page, size };
};

export default useCustomMove;
