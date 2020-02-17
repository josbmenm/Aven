import { Observable } from 'rxjs-compat';

const observeNull = Observable.create(observer => {
  observer.next(null);
});

export default observeNull;
