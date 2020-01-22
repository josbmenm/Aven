import { setupJournalbeat } from './Journalbeat';
import { setupNetdata } from './Netdata';
import { setupCockpit } from './Cockpit';
import { setupFailureNotificationService } from './FailureNotificationServices';
import { setupPersistentJournal } from './PersistentJournal';

export async function setupMonitoringTools() {
  const parallelJobs = [
    setupJournalbeat(),
    setupNetdata(),
    setupCockpit(),
    setupFailureNotificationService(),
    setupPersistentJournal(),
  ];

  return Promise.all(parallelJobs);
}
