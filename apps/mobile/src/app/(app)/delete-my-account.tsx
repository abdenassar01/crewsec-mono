import React from 'react';

import { Header, RootWrapper } from '@/components/common';

export default function DeleteMyAccount() {
  // const { mutate } = useDeleteUser();

  return (
    <RootWrapper className="container">
      <Header title="Delete My Account" />
      {/* {!parking && <Text>You are not logged in</Text>} */}

      {/* <Button
        label="Delete my account"
        variant="destructive"
        onPress={() => {
          mutate({ id: parking?.user?.id || 0 });
        }}
      /> */}
    </RootWrapper>
  );
}
