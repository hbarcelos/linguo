import { Task, TaskParty } from '~/features/tasks';
import { createSkillsTaskMatcher } from './skillsMatchTask';
import Web3 from 'web3';

const { toBN } = Web3.utils;

/**
 * Get a filter predicate function based on a predefined name.
 *
 * @param {'all'|'open'|'inProgress'|'inReview'|'inDispute'|'finished'|'incomplete'} filterName The name of the filter
 * @param {Object} params The comparator params
 * @param {Object} params.account The account which is viewing the task list
 * @param {Array= []} params.skills The translator skills.
 * @return TaskComparator a filter predicated function to be used with Array#filter.
 */
export function getComparator(filterName, { account, skills = [] }) {
  const skillsMatch = createSkillsTaskMatcher(skills);

  const comparatorMap = {
    all: {
      incompleteLast: (a, b) => Task.isIncomplete(a) - Task.isIncomplete(b),
      remainingTimeForSubmissionDesc: (a, b) => {
        const currentDate = new Date();
        return (
          -1 *
          (Task.remainingTimeForSubmission(b, { currentDate }) - Task.remainingTimeForSubmission(a, { currentDate }))
        );
      },
      id: -1,
    },
    open: {
      withMatchingSkillsFirst: (a, b) => skillsMatch(b) - skillsMatch(a),
      currentPricePerWordDesc: (a, b) => {
        const currentDate = new Date();
        return sortBNDescending(
          toBN(Task.currentPricePerWord({ ...a, currentPrice: Task.currentPrice(a, { currentDate }) })),
          toBN(Task.currentPricePerWord({ ...b, currentPrice: Task.currentPrice(b, { currentDate }) }))
        );
      },
      id: -1,
    },
    inProgress: {
      withMatchingSkillsFirst: (a, b) => skillsMatch(b) - skillsMatch(a),
      remainingTimeForSubmissionDesc: (a, b) => {
        const currentDate = new Date();
        return (
          -1 *
          (Task.remainingTimeForSubmission(b, { currentDate }) - Task.remainingTimeForSubmission(a, { currentDate }))
        );
      },
      id: -1,
    },
    inReview: {
      withMatchingSkillsFirst: (a, b) => skillsMatch(b) - skillsMatch(a),
      showLastIfIsTranslator: (a, b) => {
        const isTranslatorOfA = Task.partyOf(a, { account }) === TaskParty.Translator;
        const isTranslatorOfB = Task.partyOf(b, { account }) === TaskParty.Translator;

        return isTranslatorOfA === isTranslatorOfB ? 0 : isTranslatorOfB ? -1 : 1;
      },
      remainingTimeForReviewDesc: (a, b) => {
        const currentDate = new Date();
        return -1 * (Task.remainingTimeForReview(b, { currentDate }) - Task.remainingTimeForReview(a, { currentDate }));
      },
      id: -1,
    },
    inDispute: {
      withMatchingSkillsFirst: (a, b) => skillsMatch(b) - skillsMatch(a),
      showFirstIfIsTranslatorOrChallenger: (a, b) => {
        const isTranslatorOrChallengerOfA = [TaskParty.Translator, TaskParty.Challenger].includes(
          Task.partyOf(a, { account })
        );
        const isTranslatorOrChallengerOfB = [TaskParty.Translator, TaskParty.Challenger].includes(
          Task.partyOf(b, { account })
        );

        return isTranslatorOrChallengerOfA === isTranslatorOrChallengerOfB ? 0 : isTranslatorOrChallengerOfB ? 1 : -1;
      },
      disputeId: -1,
    },
    finished: {
      id: -1,
    },
    incomplete: {
      showFirstIfIsTranslator: (a, b) => {
        const isTranslatorOfA = Task.partyOf(a, { account }) === TaskParty.Translator;
        const isTranslatorOfB = Task.partyOf(b, { account }) === TaskParty.Translator;

        return isTranslatorOfA === isTranslatorOfB ? 0 : isTranslatorOfB ? 1 : -1;
      },
      status: -1,
      lastInteraction: -1,
      id: -1,
    },
  };

  const descriptor = comparatorMap[filterName] ?? comparatorMap.all;

  const customSorting = (a, b) =>
    Object.entries(descriptor).reduce((order, [prop, signOrComparator]) => {
      const hasDefinedOrder = order !== 0;
      const primitiveComparator = primitiveTypeToComparator[typeof a[prop]] ?? primitiveTypeToComparator.number;

      return hasDefinedOrder
        ? order
        : typeof signOrComparator === 'number'
        ? signOrComparator * primitiveComparator(a[prop], b[prop])
        : signOrComparator(a, b);
    }, 0);

  return customSorting;
}

const primitiveTypeToComparator = {
  number: (a, b) => b - a,
  string: (a, b) => a.localeCompare(b),
  boolean: (a, b) => b - a,
};

const sortBNAscending = (a, b) => (a.gt(b) ? 1 : b.gt(a) ? -1 : 0);

const sortBNDescending = (a, b) => -1 * sortBNAscending(a, b);

/**
 * This callback is displayed as a global member.
 * @callback TaskComparator
 * @param {object} a A task object.
 * @param {object} b A task object.
 * @return {number} A number indicating the sort order compatible with Array#sort()
 */
