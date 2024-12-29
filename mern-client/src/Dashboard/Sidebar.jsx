import React from 'react';
import { Sidebar as FlowbiteSidebar } from "flowbite-react";
import { HiChartPie, HiInbox, HiOutlineCloud } from "react-icons/hi";
import { Link } from 'react-router-dom';

export function Sidebar() {
  return (
    <FlowbiteSidebar>
      <FlowbiteSidebar.Items>
        <FlowbiteSidebar.ItemGroup>
          <FlowbiteSidebar.Item as={Link} to="/dashboard" icon={HiChartPie}>
            <p>Dashboard</p>
          </FlowbiteSidebar.Item>
          <FlowbiteSidebar.Item as={Link} to="/dashboard/upload" icon={HiOutlineCloud}>
            <p>UploadBooks</p>
          </FlowbiteSidebar.Item>
          <FlowbiteSidebar.Item as={Link} to="/dashboard/manage" icon={HiInbox}>
            <p>ManageBooks</p>
          </FlowbiteSidebar.Item>
        </FlowbiteSidebar.ItemGroup>
      </FlowbiteSidebar.Items>
    </FlowbiteSidebar>
  );
}