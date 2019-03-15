// import Dbms from './dbms';
import DbmsFactory from '../core/dbmsFactory';

const createDatabase = () => DbmsFactory({ services: [], proxies: [] });

export default createDatabase;

// project meta
// base meta
