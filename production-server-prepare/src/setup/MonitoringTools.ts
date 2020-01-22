import { setupJournalbeat } from './MonitorTools/Journalbeat';
import { setupNetdata } from './MonitorTools/Netdata';
import { setupCockpit } from './MonitorTools/Cockpit';
import { setupFailureNotificationService } from './MonitorTools/FailureNotificationServices';
import { setupPersistentJournal } from './MonitorTools/PersistentJournal';

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
