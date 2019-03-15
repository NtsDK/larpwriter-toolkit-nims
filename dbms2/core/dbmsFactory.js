import Dbms from './dbms';

const createDatabase = ({ services, proxies }) => new Dbms(services);

export default createDatabase;

// project meta
// base meta
