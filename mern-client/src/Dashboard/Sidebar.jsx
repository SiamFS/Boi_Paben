import React from 'react';
import { Sidebar as FlowbiteSidebar } from "flowbite-react";
import { HiChartPie, HiInbox, HiOutlineCloud} from "react-icons/hi";


export function Sidebar() {
  return (
    <FlowbiteSidebar>
      <FlowbiteSidebar.Items>
        <FlowbiteSidebar.ItemGroup>
          <FlowbiteSidebar.Item href="/dashboard" icon={HiChartPie}>
            <p>Dashboard</p>
          </FlowbiteSidebar.Item>
          <FlowbiteSidebar.Item href="/dashboard/upload" icon={HiOutlineCloud}>
            <p>UploadBooks</p>
          </FlowbiteSidebar.Item>
          <FlowbiteSidebar.Item href="/dashboard/manage" icon={HiInbox}>
            <p>ManageBooks</p>
          </FlowbiteSidebar.Item>
        </FlowbiteSidebar.ItemGroup>
      </FlowbiteSidebar.Items>
    </FlowbiteSidebar>
  );
}