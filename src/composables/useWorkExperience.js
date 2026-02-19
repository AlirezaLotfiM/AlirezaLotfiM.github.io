import { usePortfolio } from './usePortfolio.js';

export function useWorkExperience() {
  const { workExperience } = usePortfolio();

  return {
    workExperiences: workExperience
  };
}
