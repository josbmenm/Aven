import { BehaviorSubject } from 'rxjs-compat';

export default function mapBehaviorSubject(behavior, mapFn) {
  const mappedSubject = new BehaviorSubject(mapFn(behavior.getValue()));
  behavior.subscribe({
    next: value => mappedSubject.next(mapFn(value)),
  });
  return mappedSubject;
}
