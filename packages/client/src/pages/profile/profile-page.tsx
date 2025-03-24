import React, { useState } from "react";

import "./profile-page.scss";
import { Card } from "@/components/card/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleUser } from "@fortawesome/free-solid-svg-icons";
import { useUser } from "@/contexts";
import { GameStats } from "./game-stats/game-stats";
import { Table } from "@/components/table/table";
import { GameHistory } from "./game-history/game-history";
import { Modal } from "@/components/modal/modal";
import { Button } from "@/components/button/button";
import { ChangePasswordForm } from "./change-password-form/change-password";

export const ProfilePage: React.FC = () => {
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const user = useUser();
  return (
    <div className="profile-page">
      <Modal
        title="Change Password"
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      >
        <ChangePasswordForm />
      </Modal>
      <div className="profile-page__summary-section">
        <div className="profile-page__user-section-card">
          <Card fullHeight>
            <div className="profile-page__user-section">
              <FontAwesomeIcon
                className="profile-page__user-icon"
                icon={faCircleUser}
              />
              <p className="profile-page__username">{user.username}</p>
              <p>{user.email}</p>
              <Button onClick={() => setIsChangePasswordModalOpen(true)}>
                Change Password
              </Button>
            </div>
          </Card>
        </div>

        <Card>
          <GameStats />
        </Card>
      </div>
      <Card>
        <GameHistory />
      </Card>
    </div>
  );
};
