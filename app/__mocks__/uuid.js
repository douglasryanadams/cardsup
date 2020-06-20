const mockUuid = jest.createMockFromModule('uuid')
mockUuid.v4 = jest.fn(() => 'a-b-c-d')

module.exports = mockUuid
