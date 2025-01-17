import React from 'react';
import { Task, TaskStatus } from '~/features/tasks';
import TaskIgnoredAvatar from '~/assets/images/avatar-task-incomplete.svg';
import Spacer from '~/shared/Spacer';
import useTask from '../../../useTask';
import TaskStatusDetailsLayout from '../../components/TaskStatusDetailsLayout';
import ContextAwareTaskInteractionButton from '../../components/ContextAwareTaskInteractionButton';
import TaskDeadline from '../../components/TaskDeadline';

function IncompleteForRequester() {
  const task = useTask();
  const isPending = Task.isPending(task);
  const isAssigned = task.status === TaskStatus.Assigned;

  const title = 'This translation was not completed on time';

  const props = isPending
    ? {
        title,
        description: isAssigned
          ? [
              'We will send the Translator Deposit + the bounty back to the requester in a few moments.',
              'You can help speed up this proccess if you like.',
            ]
          : [
              'The requester will be automatically reimbursed in a few moments.',
              'You can help speed up this proccess if you like.',
            ],
        interaction: (
          <>
            <TaskDeadline />
            <Spacer />
            <ContextAwareTaskInteractionButton
              interaction={ContextAwareTaskInteractionButton.Interaction.Reimburse}
              content={{
                idle: { text: isAssigned ? 'Send Deposit' : 'Reimburse Requester' },
              }}
              buttonProps={{ fullWidth: true }}
            />
          </>
        ),
      }
    : {
        title,
        description: isAssigned
          ? ['The requester received the bounty back + the Translator Deposit.']
          : ['The requester was reimbursed of the bounty.'],
        illustration: <TaskIgnoredAvatar />,
      };

  return <TaskStatusDetailsLayout {...props} />;
}

export default IncompleteForRequester;
