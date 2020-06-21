Feature: Session
  We need to manage Scrum Poker sessions
  and make sure everyone gets messages they're supposed to get

  Scenario: create a new session
    Given My session does not exist yet
    When I create a new session
    Then I receive a response with status: 'success'

  Scenario: join an existing session
    Given A session exists
    When I join that session
    Then I receive a response with status: 'success'

  Scenario: create multiple sessions
    Given A session exists
    When I create a new session
    Then I receive a response with status: 'success'

  Scenario: session with multiple users
    Given A session exists
    When I join that session
    Then I receive a response with status: 'success'
    When Another user joins that session
    Then I receive a response with status: 'success'
    And I receive a list of 3 users
