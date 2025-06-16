
export function withAuth(WrappedComponent) {
  return function WithAuth(props) {
    // can check path router permission in this function
    return <WrappedComponent {...props} />;
  };
}