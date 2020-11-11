import { useSelector, useDispatch } from 'react-redux';
import { getProjects } from '../selectors';

export const useProjects = () => {
  const dispatch = useDispatch();
  const projects = useSelector(getProjects());

  return { projects, dispatch };
};